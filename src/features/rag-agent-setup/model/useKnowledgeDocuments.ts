import { onScopeDispose, ref } from "vue"
import { ragAgentApi, type DocumentResponse } from "@/entities/rag-agent"

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".txt"]

export interface DocumentDraft {
  /** Client-side key; the server id arrives once the upload finishes. */
  key: string
  name: string
  sizeBytes: number
  status: "embedding" | "indexed" | "failed"
  /** Embedding progress, 0–1. */
  progress: number
  documentId: string | null
  chunkCount: number | null
  /** The server's reason for a failed upload, when it gave one. */
  error: string | null
}

export interface FileRejection {
  file: File
  /** i18n key of why the file was skipped. */
  reason: string
}

const rejection = (reason: string) =>
  `dashboard.rag.knowledge.rejected.${reason}`

let draftSequence = 0

const pause = (milliseconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds)
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true }
    )
  })

const fromRow = (row: DocumentResponse): DocumentDraft => ({
  key: `document-${row.document_id}`,
  name: row.name,
  sizeBytes: row.size_bytes,
  status:
    row.status === "indexed" || row.status === "failed"
      ? row.status
      : "embedding",
  progress: row.status === "indexed" ? 1 : row.progress,
  documentId: row.document_id,
  chunkCount: row.chunk_count,
  error: row.error,
})

/**
 * The documents an agent answers from. Files start uploading as soon as they
 * are added and are polled until indexed, so nothing waits for a submit
 * button. Uploads go to the first of `collections`.
 */
export function useKnowledgeDocuments(
  businessId: () => string,
  collections: () => string[]
) {
  const documents = ref<DocumentDraft[]>([])
  const maxFileBytes = ref<number | null>(null)

  const followers = new Map<string, AbortController>()
  onScopeDispose(() => followers.forEach((controller) => controller.abort()))

  const find = (key: string) => documents.value.find((item) => item.key === key)

  const rejectionReason = (file: File): string | null => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(extension)) return rejection("unsupported")
    if (maxFileBytes.value === null) return rejection("loading")
    if (file.size > maxFileBytes.value) return rejection("tooLarge")
    const duplicate = documents.value.some(
      (item) => item.name === file.name && item.sizeBytes === file.size
    )
    return duplicate ? rejection("duplicate") : null
  }

  /** Runs `work` for a row; an error marks the row failed. */
  const follow = async (
    key: string,
    work: (signal: AbortSignal) => Promise<void>
  ) => {
    const controller = new AbortController()
    followers.set(key, controller)
    try {
      await work(controller.signal)
    } catch (error) {
      // Removing a document aborts its upload; that is not a failure.
      if (!controller.signal.aborted) {
        const draft = find(key)
        if (draft) {
          draft.status = "failed"
          draft.error = (error instanceof Error && error.message) || null
        }
      }
    } finally {
      followers.delete(key)
    }
  }

  const pollUntilIndexed = async (
    key: string,
    collection: string,
    documentId: string,
    signal: AbortSignal
  ) => {
    while (!signal.aborted) {
      const rows = await ragAgentApi.listDocuments(businessId(), collection)
      const row = rows.find((item) => item.document_id === documentId)
      if (!row) throw new Error()
      const draft = find(key)
      if (!draft) return
      draft.progress =
        row.status === "processing" ? Math.max(0.1, row.progress) : row.progress
      draft.chunkCount = row.chunk_count
      draft.error = row.error
      if (row.status === "indexed") {
        draft.status = "indexed"
        draft.progress = 1
        return
      }
      if (row.status === "failed") throw new Error(row.error ?? undefined)
      await pause(1000, signal)
    }
  }

  const upload = (file: File, collection: string) => {
    const key = `document-draft-${++draftSequence}`
    // Pushed synchronously so a duplicate later in the same batch is caught.
    documents.value.push({
      key,
      name: file.name,
      sizeBytes: file.size,
      status: "embedding",
      progress: 0,
      documentId: null,
      chunkCount: null,
      error: null,
    })
    void follow(key, async (signal) => {
      const documentId = await ragAgentApi.uploadDocument(
        businessId(),
        collection,
        file,
        signal
      )
      const uploaded = find(key)
      if (uploaded) {
        uploaded.documentId = documentId
        uploaded.progress = 0.05
      }
      await pollUntilIndexed(key, collection, documentId, signal)
    })
  }

  /** Starts uploading every acceptable file and returns the ones skipped. */
  const addFiles = (files: Iterable<File>): FileRejection[] => {
    const [collection] = collections()
    const rejected: FileRejection[] = []
    for (const file of files) {
      const reason = collection
        ? rejectionReason(file)
        : rejection("noCollection")
      if (reason) rejected.push({ file, reason })
      else upload(file, collection)
    }
    return rejected
  }

  const removeDocument = (key: string) => {
    const document = find(key)
    followers.get(key)?.abort()
    documents.value = documents.value.filter((item) => item.key !== key)
    if (document?.documentId) {
      void ragAgentApi.deleteDocument(businessId(), document.documentId)
    }
  }

  /** Replaces the list with what the collections hold and resumes polling. */
  const load = async () => {
    followers.forEach((controller) => controller.abort())
    const listed = await Promise.all(
      collections().map(async (collection) => {
        const rows = await ragAgentApi.listDocuments(businessId(), collection)
        return rows.map((row) => ({ row, collection }))
      })
    )
    documents.value = listed.flat().map(({ row }) => fromRow(row))
    for (const { row, collection } of listed.flat()) {
      const draft = fromRow(row)
      if (draft.status !== "embedding") continue
      void follow(draft.key, async (signal) => {
        await pause(1000, signal)
        await pollUntilIndexed(draft.key, collection, row.document_id, signal)
      })
    }
  }

  return {
    documents,
    maxFileBytes,
    addFiles,
    removeDocument,
    load,
  }
}

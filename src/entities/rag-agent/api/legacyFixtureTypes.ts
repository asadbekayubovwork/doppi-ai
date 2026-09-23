import type {
  ChatMessage,
  ConversationDetail,
  RagAgent,
  RetrievedSource,
  SourceCitation,
} from "../model/types"

// Historical, unused showcase data predates the live RAG evidence contract.
// Keep its shape separate so production citations continue requiring chunk IDs.
export type LegacyRagAgent = Omit<
  RagAgent,
  "systemPrompt" | "collections" | "topK" | "similarityThreshold"
>
export type LegacySourceCitation = Pick<SourceCitation, "document" | "location">
type LegacyChatMessage = Omit<ChatMessage, "citations"> & {
  citations?: LegacySourceCitation[]
}
type LegacyRetrievedSource = Omit<RetrievedSource, "chunks">
export type LegacyConversationDetail = Omit<
  ConversationDetail,
  "messages" | "retrievedSources"
> & {
  messages: LegacyChatMessage[]
  retrievedSources: LegacyRetrievedSource[]
}

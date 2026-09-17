/**
 * Hands the browser a file generated on the client (a CSV export, a chat
 * transcript) without a round trip to the server.
 */
export function downloadFile(
  filename: string,
  content: string,
  type = "text/plain;charset=utf-8"
): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** RFC 4180 quoting: cells with commas, quotes or newlines are wrapped. */
export function toCsv(
  rows: ReadonlyArray<ReadonlyArray<string | number>>
): string {
  const cell = (value: string | number) => {
    const text = String(value)
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return rows.map((row) => row.map(cell).join(",")).join("\r\n")
}

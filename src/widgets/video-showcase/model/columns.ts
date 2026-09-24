export type ShowcaseTag = "reels" | "shorts" | "avatar" | "product"

export interface ShowcaseTile {
  /** File name under `public/videos`. */
  file: string
  /** Share of the column's height, as a flex-grow weight. */
  grow: number
  /** Key under `studio.tags`, shown as a chip in the tile's corner. */
  tag?: ShowcaseTag
}

/**
 * The video wall, column by column. Every clip is 9:16; each tile crops it to
 * whatever shape its column gives. Phones show the first two columns, sm the
 * first three and lg all five, so the leading columns carry the key tags.
 */
export const SHOWCASE_COLUMNS: ShowcaseTile[][] = [
  [
    { file: "353daae1-e520-486b-b7d5-83f026169305.mp4", grow: 3 },
    { file: "18bbd999-1cf7-429d-9e1d-67acf7d8769f.mp4", grow: 7, tag: "reels" },
  ],
  [
    { file: "1cc0289d-074e-4eff-b273-4d430e416c61.mp4", grow: 6 },
    { file: "5d920c0b-523d-443f-b122-a09de57d66f7-7421d168255a357a.mp4", grow: 4, tag: "avatar" },
  ],
  [
    { file: "04f54ce5-c138-46f9-b3ff-9326d1383ca3.mp4", grow: 5 },
    { file: "593b1f6d-1967-4dce-ac20-2d5df33e94b0.mp4", grow: 5 },
  ],
  [
    { file: "30ff2469-cd60-4b50-9cc3-3001670b8a56.mp4", grow: 4.5, tag: "shorts" },
    { file: "9f8bc173-e29a-4fa9-8809-4f6ba0475974-74d89c050f6fa165.mp4", grow: 5.5 },
  ],
  [
    { file: "68a696dc-2c2e-43b1-b285-511c8783db1f.mp4", grow: 3 },
    { file: "4f850ef0-78aa-4df9-bb60-cb32e12c6672.mp4", grow: 7, tag: "product" },
  ],
]

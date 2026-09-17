import { parse } from "vue/compiler-sfc"

// NodeTypes / ElementTypes from @vue/compiler-core.
const TEXT = 2
const COMMENT = 3
const ELEMENT = 1
const TEMPLATE_TAG = 3

const pages = import.meta.glob("../*.vue", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

/**
 * App.vue renders every page inside `<Transition mode="out-in">`. A page whose
 * template root is a fragment — a second element, a `<template>`, or just a
 * leading comment, which dev builds keep — never reports the end of its leave
 * transition, so the next page is never mounted and the screen stays blank.
 */
describe("routed page templates", () => {
  it.each(Object.keys(pages))("%s renders a single element root", (file) => {
    const { descriptor } = parse(pages[file], { filename: file })
    const roots = (descriptor.template?.ast?.children ?? []).filter(
      (node) => !(node.type === TEXT && !node.content.trim())
    )

    expect(roots.map((node) => node.type)).toEqual([ELEMENT])
    expect(roots[0]).not.toMatchObject({ tagType: TEMPLATE_TAG })
    expect(roots.some((node) => node.type === COMMENT)).toBe(false)
  })
})

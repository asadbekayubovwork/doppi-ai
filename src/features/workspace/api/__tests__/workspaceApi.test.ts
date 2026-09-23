import { apiClient } from "@/shared/api"
import { workspaceApi } from "../workspaceApi"

describe("workspace backend contracts", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("uses profile and session endpoints", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue([] as never)
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue({} as never)
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue({} as never)

    await workspaceApi.updateProfile({ first_name: "Azizbek" })
    await workspaceApi.changePassword({
      current_password: "old",
      new_password: "new",
    })
    await workspaceApi.listSessions()
    await workspaceApi.revokeSession("session-1")
    await workspaceApi.logoutAll()

    expect(patch).toHaveBeenCalledWith("/me", { first_name: "Azizbek" })
    expect(post).toHaveBeenNthCalledWith(1, "/auth/password", {
      current_password: "old",
      new_password: "new",
    })
    expect(get).toHaveBeenCalledWith("/auth/sessions")
    expect(remove).toHaveBeenCalledWith("/auth/sessions/session-1")
    expect(post).toHaveBeenNthCalledWith(2, "/auth/logout-all")
  })

  it("uses team and invitation endpoints", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue([] as never)
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue({} as never)
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue({} as never)

    await workspaceApi.listMembers("business-1")
    await workspaceApi.inviteMember("business-1", {
      email: "a@b.uz",
      role: "member",
    })
    await workspaceApi.updateMember("business-1", "user-1", "admin")
    await workspaceApi.removeMember("business-1", "user-1")
    await workspaceApi.acceptInvitation("token")

    expect(get).toHaveBeenCalledWith("/businesses/business-1/members")
    expect(post).toHaveBeenNthCalledWith(
      1,
      "/businesses/business-1/invitations",
      {
        email: "a@b.uz",
        role: "member",
      }
    )
    expect(patch).toHaveBeenCalledWith(
      "/businesses/business-1/members/user-1",
      { role: "admin" }
    )
    expect(remove).toHaveBeenCalledWith("/businesses/business-1/members/user-1")
    expect(post).toHaveBeenNthCalledWith(2, "/invitations/token/accept")
  })

  it("uses API key endpoints", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue([] as never)
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({} as never)
    const remove = vi.spyOn(apiClient, "delete").mockResolvedValue({} as never)

    await workspaceApi.listApiKeys("business-1")
    await workspaceApi.createApiKey("business-1", {
      name: "Production",
      scopes: ["read"],
    })
    await workspaceApi.rotateApiKey("business-1", "key-1")
    await workspaceApi.revokeApiKey("business-1", "key-1")

    expect(get).toHaveBeenCalledWith("/businesses/business-1/api-keys")
    expect(post).toHaveBeenNthCalledWith(1, "/businesses/business-1/api-keys", {
      name: "Production",
      scopes: ["read"],
    })
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/businesses/business-1/api-keys/key-1/rotate"
    )
    expect(remove).toHaveBeenCalledWith("/businesses/business-1/api-keys/key-1")
  })
})

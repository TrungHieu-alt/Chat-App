
import { baseClient, handleRequest} from "../baseClient"

const userApi = {
  async updateProfile(data) {
    return handleRequest(baseClient.put("/user/update",data))
  },

  async deleteAccount(data) {
    return handleRequest(baseClient.put("/user/delete", data)) // soft delete
  },

  async getMyConversations() {
    return handleRequest(baseClient.get("/user/getMyConversations"))
  },

  async getOtherUsers() {
    return handleRequest(baseClient.get("/user/getOtherUsers"))
  },
}

export default userApi

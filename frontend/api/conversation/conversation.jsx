
import { baseClient, handleRequest} from "../baseClient"

const conversationApi = {
  async createNewConversation(data) {
    return handleRequest(baseClient.post("/conversation/createNewConversation",data))
  },

  async getMyConversations() {
    return handleRequest(baseClient.get("/conversation/getMyConversations"))
  },

  async getConversationMessages(id) {
    return handleRequest(baseClient.get(`/conversation/getConversationMessages/${id}`))
  },

}

export default conversationApi


import { baseClient, handleRequest} from "../baseClient"

const messageApi = {
  async createMessage(data) {
    return handleRequest(baseClient.post("/message/createMessage",data))
  },

//   async getMyConversations() {
//     return handleRequest(baseClient.get("/conversation/getMyConversations"))
//   },

//   async getConversationMessages(id) {
//     return handleRequest(baseClient.get(`/conversation/getConversationMessages/${id}`))
//   },

}

export default messageApi

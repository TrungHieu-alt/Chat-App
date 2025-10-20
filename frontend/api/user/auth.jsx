
import { baseClient, handleRequest} from "../baseClient"

const authApi = {
  async signup(data) {
    return handleRequest(baseClient.post("/auth/signup",data))
  },

  async login(data) {
    return handleRequest(baseClient.post("/auth/login", data))
  },

  async updatePassword(data) {
    return handleRequest(baseClient.put("/auth/updatePassword", data))
  },
}

export default authApi

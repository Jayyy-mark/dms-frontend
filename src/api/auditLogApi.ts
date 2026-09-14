import api from "../helpers/api"
import { Log } from "../interfaces/log"

export const auditLogApi = {
    async all():Promise<Log[]>{
        const res = await api.get("log/all/");
        return res.data.logs;
    }
}
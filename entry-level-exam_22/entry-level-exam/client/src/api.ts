import axios from 'axios';
import {APIRootPath} from '@fed-exam/config';
var functions: { [id: string] : Function; } = {};
functions["title"] = ((x:Ticket,y:Ticket) => {return x.title < y.title? -1:1 });
functions["date"] = (x:Ticket,y:Ticket) => {return x.creationTime < y.creationTime? -1:1 };
functions["email"] = (x:Ticket,y:Ticket) => {return x.userEmail < y.userEmail? -1:1 };
export type Ticket = {
    id: string,
    title: string;
    content: string;
    creationTime: number;
    userEmail: string;
    labels?: string[];
}

export type ApiClient = {
    getTickets: (i:number,sortBy?:string) => Promise<Ticket[]>;
}

export const createApiClient = (): ApiClient => {
    return {
        getTickets: (i:number,sortBy?:string) => {
            return sortBy ? 
            axios.get(APIRootPath, {params:{numPage:i}}).then((res) => res.data.sort(functions[sortBy]))
            :axios.get(APIRootPath, {params:{numPage:i}}).then((res) => res.data);
        }
    }
}


import express from 'express';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';
import { serverAPIPort, APIPath} from '@fed-exam/config';
import {Ticket} from '../client/src/api';


let functions: { [id: string] : (x:Ticket,y:Ticket) => number} = {};
functions["title"] = ((x:Ticket,y:Ticket):number => {return x.title < y.title? -1:1; });
functions["date"] = ((x:Ticket,y:Ticket):number => {return x.creationTime < y.creationTime? -1:1; }) ;
functions["email"] = ((x:Ticket,y:Ticket):number => {return x.userEmail < y.userEmail? -1:1 ;});

console.log('starting server', { serverAPIPort, APIPath });

const app = express();

const PAGE_SIZE = 20;
app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get(APIPath, (req, res) => {

  // @ts-ignore
  
  const page: number = req.query.numPage || 1;
  const sorteData = req.query.sortBy ?
                    req.query.descending ?
                    tempData.sort(functions[req.query.sortBy.toString()]).reverse():
                    tempData.sort(functions[req.query.sortBy.toString()]):
                    tempData;
  const paginatedData = sorteData.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  res.send(paginatedData);
});


app.listen(serverAPIPort);
console.log('server running', serverAPIPort)


import type { Express, Request, Response } from 'express'
import pkg from 'pg';
import { isQuestionOrPlusOrMinusToken } from 'typescript';
const { Pool } = pkg;

const pool = new Pool({
  user: "for_chen_user",
  host: "dpg-ct20r13tq21c73esqbsg-a.oregon-postgres.render.com",
  database: "for_chen",
  password: "bKlaHCvxOGNTv0R9PqMPdLvi4G6yBT53"  ,
  port: 5432, 
  ///////////////////////////////////////////////////
  ssl: {
      rejectUnauthorized: false,  // 如果使用自簽名證書
  }
  // ssl: false,  // 不使用 SSL 連接
  // idleTimeoutMillis: 30000,  // 30 秒後關閉閒置連接
  // connectionTimeoutMillis: 5000,  // 5 秒內必須連接資料庫，否則超時
});



const getCheatSheet = (req: Request, res: Response) => {
  pool.query("SELECT * FROM cheatsheets", (err, result) => {
    if (err || result.rows.length === 0){
      return res.status(500).json({err}); 
    }
    else{
      const des = result.rows[0]; 
      res.json({
        title: des.title, 
        description: des.description
      })
    }
  })
}


const errorReport = (req: Request, res: Response) => {
  const {title, error} = req.body; 
  pool.query('INSERT into errorreport(title, description) values ($1, $2)', [title, error], (err, result) => {
    if (err){
      return res.status(500).json({err});   
    }
    return res.status(200).send({status: 'success'}); 
  })
}

export {getCheatSheet, errorReport}; 
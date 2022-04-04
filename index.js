//导入express包
const express = require('express')

//创建express实例对象
const app = express()

//利用cors解决跨域问题
const cors = require('cors')
app.use(cors())

//封装错误消息，挂载到全局
app.use((req,res,next)=>{
  res.throwOut=(err,code=1)=>{
    return res.send({
      code,
      message: err instanceof Error ? err.message : err
    })
  }
  next();
})

//处理JSON格式的数据
app.use(express.json())

//引入路由，把app当参数传给路由
require('./router/index')(app)

//监听3000端口，并启动服务
app.listen(3000,()=>{
  console.log("The server was started,http://localhost:3000")
})
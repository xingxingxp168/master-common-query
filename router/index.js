module.exports = app => {
  const express = require('express');
  const router = express.Router();
  const db = require('../plugins/db')

  //中间件根据前端传过来的sql_id，从通用查询表中取出当前记录
  router.use(async(req,res,next)=>{
    let sqlStr = "select * from common_query where sql_id = ?"
    let sub_sql = JSON.parse(JSON.stringify(await db.query(db.platformDataSource,sqlStr,[req.body.sql_id])))[0];
    req.sourceSql = sub_sql
    next();
  })

  //中间件，分析传过来的参数
  router.use((req,res,next)=>{
    let params = JSON.parse(req.sourceSql.sql_params) //通用查询订单的查询参数
    let paramsResult=[]; //最后的参数集合
    let input_param = req.body.input_param; //前端传入的参数
    let sql = req.sourceSql.sql_content; //通查的SQL语句

    //循环通用查询里面的参数配置，如果是必须输入的，前台没有传入，需要报错。
    for(let i=0; i<params.length; i++){
			if(params[i].qtype==='like'){//处理SQL中带like语句的请求,默认给参数的两边拼上%号
				if(params[i].musthave){ //判断参数是否为必传项
					if(input_param[params[i].name]){ //判断前台有没有传必传参数的值过来,如果有,就塞进参数列表中
						paramsResult.push('%'+input_param[params[i].name]+'%')
					}else{ //否则报错,必传参数不能为空
            res.throwOut(`参数${params[i].name}不能为空`);
					}
				}else{ //如果不必填,也要判断前台是否有传参数值过来
					if(input_param[params[i].name]){ //如果前端有传,那需要把SQL里面的中括号去掉,并塞进参数列表中
						paramsResult.push('%'+input_param[params[i].name]+'%')
						let start = sql.indexOf('[')
						let end = sql.indexOf(']')
						let source = sql.substring(start,end+1)
						let target = sql.substring(start+1,end)
						sql = sql.replace(source,target)
					}else{ //如果前端没有传,那需要把SQL里面的这个条件删掉
						let start = sql.indexOf('[')
						let end = sql.indexOf(']')
						let source = sql.substring(start,end+1)
						sql = sql.replace(source,'')
					}
				}
			}else if(params[i].qtype==='in'){ //处理带有 in 子句的查询请求
				if(params[i].musthave){ //判断参数是否为必传项
					if(input_param[params[i].name]){ //判断前台有没有传必传参数的值过来,如果有,就塞进参数列表中
						paramsResult.push(input_param[params[i].name].split(','))
					}else{//否则报错,必传参数不能为空
						res.throwOut(`参数${params[i].name}不能为空`);
					}
				}else{ //如果不必填,也要判断前台是否有传参数值过来
					if(input_param[params[i].name]){ //如果前端有传,那需要把SQL里面的中括号去掉,并塞进参数列表中
						paramsResult.push(input_param[params[i].name].split(','))
						let start = sql.indexOf('[')
						let end = sql.indexOf(']')
						let source = sql.substring(start,end+1)
						let target = sql.substring(start+1,end)
						sql = sql.replace(source,target)
					}else{ //如果前端没有传,那需要把SQL里面的这个条件删掉
						let start = sql.indexOf('[')
						let end = sql.indexOf(']')
						let source = sql.substring(start,end+1)
						sql = sql.replace(source,'')
					}
				}
			}else{ //即不是like也不是in的一般条件都走这里
				if(params[i].musthave){//判断参数是否为必传项
					if(input_param[params[i].name]){//判断前台有没有传必传参数的值过来,如果有,就塞进参数列表中
						paramsResult.push(input_param[params[i].name])
					}else{//否则报错,必传参数不能为空
						res.throwOut(`参数${params[i].name}不能为空`);
					}
				}else{//如果不必填,也要判断前台是否有传参数值过来
					if(input_param[params[i].name]){//如果前端有传,那需要把SQL里面的中括号去掉,并塞进参数列表中
						paramsResult.push(input_param[params[i].name])
						let start = sql.indexOf('[')
						let end = sql.indexOf(']')
						let source = sql.substring(start,end+1)
						let target = sql.substring(start+1,end)
						sql = sql.replace(source,target)
					}else{//如果前端没有传,那需要把SQL里面的这个条件删掉
						let start = sql.indexOf('[')
						let end = sql.indexOf(']')
						let source = sql.substring(start,end+1)
						sql = sql.replace(source,'')
					}
				}
			}
		}
    //循环传过来的参数，放入数组中，做为查询的参数
    req.sourceSql.params = paramsResult;
    req.sourceSql.sql_content = sql;
    next();
  })


  //获取总记录数
  router.use(async(req,res,next)=>{

    let index = req.sourceSql.sql_content.indexOf("from");
    let subSql = req.sourceSql.sql_content.substring(index);
    let sqlStr = "select count(1) as record_count " + subSql;

    let sub_sql = JSON.parse(JSON.stringify(await db.query(db[req.sourceSql.jdbc_name],sqlStr,req.sourceSql.params)))[0];

    //把总记录数挂到req对象上面
    req.sourceSql.record_count = sub_sql.record_count;

    next();
    
  })



  //拼接分页参数
  router.use((req,res,next)=>{
    req.sourceSql.sql_content += ` limit ${req.body.page_num-1},${req.body.page_size}`;
    next();
  })

  //查询最后的结果
  router.post("/common-query",async(req,res)=>{

    let list = JSON.parse(JSON.stringify(await db.query(db[req.sourceSql.jdbc_name],req.sourceSql.sql_content,req.sourceSql.params)));
    
    //如果主查询有配置子查询,需要调用子查询去处理数据
    if(req.sourceSql.sub_sql_id && req.sourceSql.sub_sql_id.length>0){
      list = await require('../utils')(list,req.sourceSql.sub_sql_id)
    }
    
    res.send({
      code: 0,
      message: "成功",
      record_count: req.sourceSql.record_count,
      results: list
    })

  })

  //错误消息中间件
  router.use((err,req,res,next)=>{
    if(err) res.throwOut(err.message)
  })

  //把router挂载到app上
  app.use('/api',router)
}
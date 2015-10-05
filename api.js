module.exports = function(router,config){
  router.get('/',function(req,res){
    res.json({'foo':'bar'})
  })

  router.post('/tail',function(req,res){})
  router.post('/untail',function(req,res){})

  return router;
}

const express = require('express');
const router = express.Router();
const db = require("../models")
const total = require("../lib/total")

function checkAuth(req, res, next){
  if (req.session.user){
    next()
  }else {
    res.redirect("/")
  }
}
router.get("/", checkAuth, (req, res)=>{
  db.Expense.findAll({
    where: {
      UserId: req.session.user.id,
    }, order: [
      [
        "date", "DESC"
      ]
    ]
  })
    .then((expenses) => {
      db.Budget.findOne({
        where: {
          UserId: req.session.user.id,
        }, order: [
          [
            "createdAt", "DESC"
          ]
        ]
      })
        .then((budgets) => {
          
          db.GoalSetting.findOne({
            where:{
              UserId: req.session.user.id
            }
          })
          .then((goalSettings)=>{
            res.render('main', {
              partials: {
                head: "/partial/head"
              },
              locals: {
                title: "Sugar-Oppa",
                error: null,
                message: "Reminder: You are over budget.",
                expenses: expenses,
                
                budgets:budgets && budgets.amount_budget ? {
                  amount: budgets.amount_budget,
                  total: total(expenses),
                  remaining: budgets.amount_budget - total(expenses),
                  
                }:null,
                goalSettings: goalSettings,
                
                user: req.session.user
              }
            })
                })
              })
          
        
    })


})



// router.use("/*", checkAuth)

/* GET users listing. */

//===========================================================================
router.post("/expense", (req, res)=>{
  if(!req.body.expense || !req.body.category || !req.body.date){
    res.render("main", {
      partials: {
        head: "/partial/head"
      },
      locals: {
        error: "Please submit all required field.",
        expenses: null,
        budgets: null
      }
    })
    return;
  }
  db.Expense.create({
    category: req.body.category,
    amount_expense: req.body.expense,
    date: req.body.date,
    UserId: req.session.user.id
  })
  
  .then((expenses)=>{
    
    
    res.redirect("/main")
  })
  .catch((error)=>{
    console.error(error)
    res.status(500).json({ error: "something wrong"})
  })
})
 //====================== 
router.post("/budget", (req, res) => {
  if(!req.body.budget){
    res.render("main", {
      partials: {
        head: "/partial/head"
      },
      locals: {
        error: "Please submit all required fields.",
        budgets: null,
        expenses: null
      }
    })
    return;
  }
  db.Budget.create({
    amount_budget: req.body.budget,
    UserId: req.session.user.id
  })
  .then((budget)=> {
    res.redirect("/main")
  })
  .catch((error)=> {
    console.error(error)
    res.status(500).json({ error: "somethings wrong"})
  })
})


//logout===================================
router.get("/logout", (req, res)=>{
  req.session.user = null
  res.redirect("/")
})


//===========remove button=================



//delete=======================================
router.get('/expense/:id', (req, res) => {
  const { id } = req.params;
  db.Expense.findOne({
    where: {
      id: id,
      UserId : req.session.user.id
    }
  })
    .then(expense=>{
      if(!expense){
        res.status(404).json({error: `Could not find Expense with id: ${id}`})
        return;
      }
      res.status(204).json()
    })
});



router.delete('/expense/:id', (req, res) => {
  const { id } = req.params;
  db.Expense.destroy({
    where: {
      id: id,
      UserId : req.session.user.id
    }
  })
    .then(rowsDeleted =>{
      if (rowsDeleted === 1){
        res.status(204).json()
      }else if(rowsDeleted === 0){
        res.status(404).json({error: `Could not find Expense with id: ${id}`})
      }
    })
    .catch(e=>{
      res.status(500).json( {error: "A database error occurred"})
    })
});


// api =======================================================
// router.get('/expenses',  (req, res) => {
//   db.Expense.findAll()
//     .then((expense)=>{
//       res.json(expense)
//     })
//     .catch((error)=>{
//       console.error(error)
//       res.status(500).json({ error:`A Database Error Occurred` })
//     })
// });


router.get('/expenses',  (req, res) => {
  
  db.Expense.findAll({
    where: {
      
      UserId : req.session.user.id
    }
  })
    .then((expense)=>{
      if(!expense){
        res.status(404).json({ error: `Could not find Todo with id: ${id}`})
        return;
      }
      res.json(expense)
    })
    .catch((error)=>{
      console.error(error)
      res.status(500).json({ error:`A Database Error Occurred` })
    })
});


// router.get('/expense/:id', (req, res) => {
  
//   db.Expense.findAll({
//     where: {
      
//       id : req.session.user.id
//     }
//   })
//     .then(expense=>{
//       if(!expense){
//         res.status(404).json({error: `Could not find Expense with id: ${id}`})
//         return;
//       }
//       res.status(204).json()
//     })
// });


//============================ goal setting ===============================================

// router.get("/goalsetting", checkAuth, (req, res)=>{
//   db.GoalSetting.findOne({
//     where: {
//       UserId: req.session.user.id,
//     }
//   })
//   .then((goalSetting)=>{
//     if(!goalSetting){
//       res.status(404).json({ error: `Could not find goal}`})
//       return;
//     }
//     res.json(expense)
//   })
//   .catch((error)=>{
//     console.error(error)
//     res.status(500).json({ error:`A Database Error Occurred` })
//   })
// })













router.post("/goalsetting", (req, res)=>{
  if(!req.body.goal_name || !req.body.saving_goal){
    res.render("main", {
      locals: {
        error: "Please submit all required field.",
        expenses: null,
        budgets: null
      }
    })
    return;
  }
  db.GoalSetting.create({
    goal_name: req.body.goal_name,
    saving_goal: req.body.saving_goal,
    UserId: req.session.user.id
  })
  
  .then((goalsetting)=>{
    
    res.redirect("/main")
  })
  .catch((error)=>{
    console.error(error)
    res.status(500).json({ error: "something wrong"})
  })
})








module.exports = router;
// rendering=========================================================================
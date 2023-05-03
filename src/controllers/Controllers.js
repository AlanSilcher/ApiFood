const axios = require("axios")
const { where } = require("sequelize")
const { Recipe, Diet, recipe_diet } = require('../db')
const {API_KEY} = process.env


const filterId = async (id, source) => {
    if(source === "api"){
        const api =  (await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`)
          ).data

            const map = api.analyzedInstructions.map(el => el.steps)
            const flat = map.flat()
            const steps = flat.map(el => {
                return{
                    step: el.step
                }
            })

          return {
          id: api.id,
          name: api.title,
          image: api.image,
          description: api.summary,
          healthScore: api.healthScore,
          steps: steps,
          dietName: api.diets
      }

    } else { 
        const db = await Recipe.findByPk(id, {
        include:{ 
          model: Diet,
          attributes: ['dietName']
        } 
      })

        const diet = db.diets.map(el => {
            return {
                dietName: [el.dietName]
            }
        })

        const dietNames = diet.map(diet => diet.dietName[0]).flat();

        return {
            id: db.id,
            name: db.name,
            image: db.image,
            description: db.description,
            healthScore: db.healthScore,
            steps: [{step: db.steps}],
            dietName: dietNames
        }

    } 

} 

const getAllName = async () => {  
  const recipes = (
        await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)
      ).data   
      
      const api = recipes.results.map(el => {
            return {
                id: el.id,
                name: el.title,
                image: el.image,
                description: el.summary,
                healthScore: el.healthScore,
                steps: el.steps,
                diets: el.diets
            }
          })

          const a = await Recipe.findAll({include: { model: Diet}})

          const db = a.map(el => {
            const diets = el.diets.map(el => el.dietName)
            return {
                id: el.id,
                name: el.name,
                image: el.image,
                description: el.description,
                healthScore: el.healthScore,
                steps: el.steps,
                diets: diets
            }
          })

          return [...api, ...db]
}

const allDiets = async () => {
    
    const diet = (
        await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`)
      ).data

      const diets = diet.results.map(el => el.diets)

      const solution = []
     diets.map(el => {
    el.map(el2 => {
        if(!solution.includes(el2)){
          solution.push(el2)
        }
    })
})
        let id = 1
         const result = solution.map(el => {
          dietName= el
          Diet.create({dietName})
          id++
          return{
            id: id,
            dietName: el
          }
        })

        await Diet.findOrCreate({
          where: { dietName: 'vegetarian' },
          defaults: { dietName: 'vegetarian' }
        }) 

        if(!result.includes('vegetarian')){
          result.unshift({id: 1, dietName: 'vegetarian'})
      }

        return result
}

const createFood = async (name, image, description, healthScore, steps, diets) => {
    
    const newRecipe = await Recipe.create({name, image, description, healthScore, steps})
        
        for (let i = 0; i < diets.length; i++) {
          const diet = await Diet.findOne({where: {dietName: diets[i]}});
          await newRecipe.addDiet(diet);
      }

        return {
            id: newRecipe.id,
            name: name,
            image: image,
            description: description,
            healthScore: healthScore,
            steps: {step: steps},
            dietName: diets
        }
}



module.exports = {
    allDiets,
    filterId,
    createFood,
    getAllName,
}
const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
const {
    recipesId,
    listOfRecipes,
    dietsList,
    createRecipe
} = require("../handlers/Handlers")

router.get('/recipes', listOfRecipes)

router.get('/recipes/:id', recipesId)

router.get('/diets', dietsList)

router.post('/recipes', createRecipe)

module.exports = router;

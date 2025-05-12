package main

import (
	"backend/database"
	"backend/routes"
	"backend/utils"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Connexion à la base de données
	if err := database.ConnectDB(); err != nil {
		utils.Logger.Fatal().Err(err).Msg("Erreur de connexion à la base de données")
	}

	e := echo.New()
	e.Use(middleware.Recover())
	e.Use(middleware.Secure())

	// Middleware CORS (origines autorisées depuis env)
	allowOrigins := os.Getenv("ALLOW_ORIGINS")
	if allowOrigins == "" {
		allowOrigins = "*"
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{allowOrigins},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
	}))

	routes.RegisterRoutes(e)

	utils.Logger.Info().Msg("Serveur Echo démarré sur 0.0.0.0:8000")
	e.Logger.Fatal(e.Start(":8000"))
}

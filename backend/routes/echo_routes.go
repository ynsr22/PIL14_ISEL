package routes

import (
	"backend/controllers"
	"net/http"

	"github.com/labstack/echo/v4"
)

// RegisterRoutes configure les routes Echo
func RegisterRoutes(e *echo.Echo) {
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "Bienvenue sur l'API Moyens Logistiques !"})
	})

	e.GET("/categories", controllers.EchoGetCategories)
	e.GET("/categories/:id", controllers.EchoGetCategorie)
	e.GET("/categories/:id/accessoires_defauts", controllers.EchoGetAccessoiresDefauts)
	e.GET("/categories/:id/accessoires", controllers.EchoGetAccessoiresForCategorie)

	e.GET("/accessoires", controllers.EchoGetAccessoires)
	e.GET("/accessoires/:id", controllers.EchoGetAccessoire)

	e.GET("/moyens", controllers.EchoGetMoyens)
	e.GET("/moyens/:id", controllers.EchoGetMoyen)
	e.GET("/moyens/:id/accessoires_defauts", controllers.EchoGetAccessoiresDefautsMoyens)
	e.GET("/moyens/:id/accessoires", controllers.EchoGetAccessoiresForMoyen)
}

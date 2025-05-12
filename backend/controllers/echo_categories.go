package controllers

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// EchoGetCategories : handler Echo pour obtenir toutes les catégories
func EchoGetCategories(c echo.Context) error {
	query := "SELECT id, nom FROM categories"
	rows, err := database.DB.Query(c.Request().Context(), query)
	if err != nil {
		utils.Logger.Error().Err(err).Msg("❌ Erreur lors de la récupération des catégories")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors de la récupération des catégories"})
	}
	defer rows.Close()

	var categories []models.Categorie
	for rows.Next() {
		var cat models.Categorie
		if err := rows.Scan(&cat.ID, &cat.Nom); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors du scan des données"})
		}
		categories = append(categories, cat)
	}
	return c.JSON(http.StatusOK, categories)
}

// EchoGetCategorie : handler Echo pour obtenir une catégorie par ID
func EchoGetCategorie(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ ID invalide")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID invalide"})
	}
	query := "SELECT id, nom FROM categories WHERE id = $1"
	row := database.DB.QueryRow(c.Request().Context(), query, id)
	var cat models.Categorie
	if err := row.Scan(&cat.ID, &cat.Nom); err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ Catégorie non trouvée")
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Catégorie non trouvée"})
	}
	return c.JSON(http.StatusOK, cat)
}

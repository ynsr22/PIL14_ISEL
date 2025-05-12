package controllers

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// EchoGetMoyens : handler Echo pour obtenir tous les moyens roulants
func EchoGetMoyens(c echo.Context) error {
	query := "SELECT id, nom, categorie_id, roues, emplacement, type_base, taille, departement, image, prix FROM moyens_roulants"
	rows, err := database.DB.Query(c.Request().Context(), query)
	if err != nil {
		utils.Logger.Error().Err(err).Msg("❌ Erreur lors de la récupération des moyens roulants")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors de la récupération des moyens roulants"})
	}
	defer rows.Close()

	var moyens []models.MoyenRoulant
	for rows.Next() {
		var m models.MoyenRoulant
		if err := rows.Scan(&m.ID, &m.Nom, &m.CategorieID, &m.Roues, &m.Emplacement, &m.TypeBase, &m.Taille, &m.Departement, &m.Image, &m.Prix); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors du scan des données"})
		}
		moyens = append(moyens, m)
	}
	return c.JSON(http.StatusOK, moyens)
}

// EchoGetMoyen : handler Echo pour obtenir un moyen roulant par ID
func EchoGetMoyen(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ ID invalide")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID invalide"})
	}
	query := "SELECT id, nom, categorie_id, roues, emplacement, type_base, taille, departement, image, prix FROM moyens_roulants WHERE id = $1"
	row := database.DB.QueryRow(c.Request().Context(), query, id)
	var m models.MoyenRoulant
	if err := row.Scan(&m.ID, &m.Nom, &m.CategorieID, &m.Roues, &m.Emplacement, &m.TypeBase, &m.Taille, &m.Departement, &m.Image, &m.Prix); err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ Moyen roulant non trouvé")
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Moyen roulant non trouvé"})
	}
	return c.JSON(http.StatusOK, m)
}

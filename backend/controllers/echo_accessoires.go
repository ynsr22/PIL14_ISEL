package controllers

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// EchoGetAccessoires : handler Echo pour obtenir tous les accessoires
func EchoGetAccessoires(c echo.Context) error {
	query := "SELECT id, nom FROM liste_accessoire"
	rows, err := database.DB.Query(c.Request().Context(), query)
	if err != nil {
		utils.Logger.Error().Err(err).Msg("❌ Erreur lors de la récupération des accessoires")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors de la récupération des accessoires"})
	}
	defer rows.Close()

	var accessoires []models.Accessoire
	for rows.Next() {
		var a models.Accessoire
		if err := rows.Scan(&a.ID, &a.Nom); err != nil {
			utils.Logger.Error().Err(err).Msg("❌ Erreur lors du scan des données")
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors du scan des données"})
		}
		accessoires = append(accessoires, a)
	}
	return c.JSON(http.StatusOK, accessoires)
}

// EchoGetAccessoire : handler Echo pour obtenir un accessoire par ID
func EchoGetAccessoire(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ ID invalide")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID invalide"})
	}
	query := "SELECT id, nom FROM liste_accessoire WHERE id = $1"
	row := database.DB.QueryRow(c.Request().Context(), query, id)
	var a models.Accessoire
	if err := row.Scan(&a.ID, &a.Nom); err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ Accessoire non trouvé")
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Accessoire non trouvé"})
	}
	return c.JSON(http.StatusOK, a)
}

// EchoGetAccessoiresDefauts : handler Echo pour obtenir les accessoires par défaut d'une catégorie
func EchoGetAccessoiresDefauts(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ ID invalide")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID de catégorie invalide"})
	}
	query := `SELECT a.id, a.nom FROM accessoire_defaut ad JOIN liste_accessoire a ON ad.accessoire_id = a.id WHERE ad.categorie_id = $1`
	rows, err := database.DB.Query(c.Request().Context(), query, id)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ Erreur lors de la récupération des accessoires par défaut")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors de la récupération des accessoires par défaut"})
	}
	defer rows.Close()

	var accessoires []models.Accessoire
	for rows.Next() {
		var a models.Accessoire
		if err := rows.Scan(&a.ID, &a.Nom); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors du scan des données"})
		}
		accessoires = append(accessoires, a)
	}
	return c.JSON(http.StatusOK, accessoires)
}

// EchoGetAccessoiresForCategorie : handler Echo pour obtenir les accessoires compatibles d'une catégorie
func EchoGetAccessoiresForCategorie(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ ID invalide")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID de catégorie invalide"})
	}
	query := `SELECT a.id, a.nom FROM compatibilites co JOIN liste_accessoire a ON co.accessoire_id = a.id WHERE categorie_id = $1`
	rows, err := database.DB.Query(c.Request().Context(), query, id)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ Erreur lors de la récupération des accessoires compatibles")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors de la récupération des accessoires compatibles"})
	}
	defer rows.Close()

	var accessoires []models.Accessoire
	for rows.Next() {
		var a models.Accessoire
		if err := rows.Scan(&a.ID, &a.Nom); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur lors du scan des données"})
		}
		accessoires = append(accessoires, a)
	}
	return c.JSON(http.StatusOK, accessoires)
}

// EchoGetAccessoiresForMoyen : handler Echo pour obtenir les accessoires compatibles avec un moyen roulant
func EchoGetAccessoiresForMoyen(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ ID invalide")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID de moyen invalide"})
	}

	// 1. Récupérer la catégorie_id du moyen roulant
	var categorieID int
	err = database.DB.QueryRow(c.Request().Context(), `SELECT categorie_id FROM moyens_roulants WHERE id = $1`, id).Scan(&categorieID)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ Moyen roulant introuvable ou erreur BDD")
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Moyen roulant introuvable"})
	}

	// 2. Requête des accessoires compatibles pour cette catégorie
	query := `
		SELECT a.id, a.nom, a.image, a.prix
		FROM compatibilites co 
		JOIN liste_accessoire a ON co.accessoire_id = a.id 
		WHERE co.categorie_id = $1`
	rows, err := database.DB.Query(c.Request().Context(), query, categorieID)
	if err != nil {
		utils.Logger.Error().Err(err).Int("categorie_id", categorieID).Msg("❌ Erreur récupération accessoires")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur récupération accessoires"})
	}
	defer rows.Close()

	var accessoires []models.Accessoire
	for rows.Next() {
		var a models.Accessoire
		if err := rows.Scan(&a.ID, &a.Nom, &a.Image, &a.Prix); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur scan données"})
		}
		accessoires = append(accessoires, a)
	}

	return c.JSON(http.StatusOK, accessoires)
}

// EchoGetAccessoiresDefautsMoyens : handler Echo pour obtenir les accessoires par défaut d'un moyen roulant
func EchoGetAccessoiresDefautsMoyens(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ ID invalide")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID de moyen invalide"})
	}

	// 1. Récupérer la catégorie_id du moyen roulant
	var categorieID int
	err = database.DB.QueryRow(c.Request().Context(), `SELECT categorie_id FROM moyens_roulants WHERE id = $1`, id).Scan(&categorieID)
	if err != nil {
		utils.Logger.Error().Err(err).Int("id", id).Msg("❌ Moyen roulant introuvable ou erreur BDD")
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Moyen roulant introuvable"})
	}

	// 2. Requête des accessoires compatibles pour cette catégorie
	query := `SELECT a.id, a.nom, a.image, a.prix FROM accessoire_defaut ad JOIN liste_accessoire a ON ad.accessoire_id = a.id WHERE ad.categorie_id = $1`
	rows, err := database.DB.Query(c.Request().Context(), query, categorieID)
	if err != nil {
		utils.Logger.Error().Err(err).Int("categorie_id", categorieID).Msg("❌ Erreur récupération accessoires")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur récupération accessoires"})
	}
	defer rows.Close()

	var accessoires []models.Accessoire
	for rows.Next() {
		var a models.Accessoire
		if err := rows.Scan(&a.ID, &a.Nom, &a.Image, &a.Prix); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Erreur scan données"})
		}
		accessoires = append(accessoires, a)
	}

	return c.JSON(http.StatusOK, accessoires)
}

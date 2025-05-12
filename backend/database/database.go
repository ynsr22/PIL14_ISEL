package database

import (
	"backend/utils"
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

// DB représente le pool de connexions PostgreSQL
var DB *pgxpool.Pool

// ConnectDB initialise un pool de connexions
func ConnectDB() error {
	LoadEnv() // Charge `.env` en Dev, ne fait rien en Prod

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s&search_path=public",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("DB_SSLMODE"),
	)

	// Création du pool de connexions
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		utils.Logger.Error().Err(err).Msg("❌ Erreur de connexion à PostgreSQL")
		return fmt.Errorf("❌ Erreur de connexion à PostgreSQL : %w", err)
	}

	// Vérification de la connexion
	if err := pool.Ping(context.Background()); err != nil {
		utils.Logger.Error().Err(err).Msg("❌ Impossible de se connecter à PostgreSQL")
		return fmt.Errorf("❌ Impossible de se connecter à PostgreSQL : %w", err)
	}

	DB = pool
	utils.Logger.Info().Msg("✅ Connexion réussie à PostgreSQL (pgxpool) !")
	return nil
}

// CloseDB ferme le pool de connexions PostgreSQL
func CloseDB() {
	if DB != nil {
		DB.Close()
		utils.Logger.Info().Msg("✅ Connexion PostgreSQL fermée.")
	}
}

package utils

import (
	"os"
	"strings"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var Logger zerolog.Logger

func init() {
	// Niveau de log configurable via LOG_LEVEL (debug, info, warn, error, fatal, panic)
	levelStr := strings.ToLower(os.Getenv("LOG_LEVEL"))
	level := zerolog.InfoLevel
	switch levelStr {
	case "debug":
		level = zerolog.DebugLevel
	case "warn":
		level = zerolog.WarnLevel
	case "error":
		level = zerolog.ErrorLevel
	case "fatal":
		level = zerolog.FatalLevel
	case "panic":
		level = zerolog.PanicLevel
	}
	zerolog.SetGlobalLevel(level)

	// Formatage pretty pour le dev, JSON pour prod
	if strings.ToLower(os.Getenv("LOG_PRETTY")) == "true" {
		output := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: "2006-01-02 15:04:05"}
		Logger = zerolog.New(output).With().Timestamp().Logger()
	} else {
		Logger = zerolog.New(os.Stdout).With().Timestamp().Logger()
	}

	// Optionnel: enrichir avec le nom du service si SERVICE_NAME est défini
	if svc := os.Getenv("SERVICE_NAME"); svc != "" {
		Logger = Logger.With().Str("service", svc).Logger()
	}

	// Redirige le logger global de zerolog/log
	log.Logger = Logger
}

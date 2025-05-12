import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ModelViewer from './ModelViewer';

const ARModele: React.FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const modelUrl = id ? `${window.location.origin}/3d/${id}.glb` : '';

	if (!id) {
		return (
			<div className="text-center mt-4">
				<p>ID de modèle manquant</p>
				<a href="/" className="text-blue-500 underline">
					Retour à l’accueil
				</a>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-xl font-bold mb-4">Modèle AR #{id}</h1>
			<ModelViewer src={modelUrl} ar cameraControls arScale="fixed" />
		</div>
	);
};

export default ARModele;

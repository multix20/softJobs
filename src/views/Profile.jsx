import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINT } from '../config/constans';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const token = window.sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró un token de autenticación.');
      }
  
      const response = await axios.get(ENDPOINT.users, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data) {
        setUserData(response.data); // Actualiza con los datos del usuario
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      navigate('/'); // Redirige al inicio si no está autenticado
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (!userData) {
    return <p>Cargando datos del perfil...</p>;
  }

  return (
    <div className="py-5">
      <h1>
        Bienvenido <span className="fw-bold">{userData.email}</span>
      </h1>
      <h3>
        {userData.rol} en {userData.lenguage}
      </h3>
    </div>
  );
};

export default Profile;

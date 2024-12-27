import axios from 'axios';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINT } from '../config/constans';
import Context from '../contexts/Context';

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const initialForm = { email: 'docente@desafiolatam.com', password: '123456' };

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialForm);
  const { setDeveloper } = useContext(Context);

  const handleUser = (event) => setUser({ ...user, [event.target.name]: event.target.value });

  const handleForm = async (event) => {
    event.preventDefault();

    if (!user.email.trim() || !user.password.trim()) {
      return window.alert('Email y password son obligatorios.');
    }

    if (!emailRegex.test(user.email)) {
      return window.alert('El formato del email no es correcto!');
    }

    try {
      const { data } = await axios.post(ENDPOINT.login, user);

      // Guardar token en sessionStorage
      window.sessionStorage.setItem('token', data.token);

      // Mensaje de éxito
      window.alert('Usuario identificado con éxito 😀.');

      // Actualizar el contexto
      setDeveloper({});

      // Redirigir al perfil
      navigate('/perfil');
    } catch (error) {
      // Manejo de errores específicos del backend
      const errorMessage = error.response?.data?.error || 'Ocurrió un error inesperado.';
      console.error('Error en el inicio de sesión:', errorMessage);
      window.alert(`${errorMessage} 🙁.`);
    }
  };

  return (
    <form onSubmit={handleForm} className="col-10 col-sm-6 col-md-3 m-auto mt-5">
      <h1>Iniciar Sesión</h1>
      <hr />
      <div className="form-group mt-1">
        <label>Email address</label>
        <input
          value={user.email}
          onChange={handleUser}
          type="email"
          name="email"
          className="form-control"
          placeholder="Enter email"
        />
      </div>
      <div className="form-group mt-1">
        <label>Password</label>
        <input
          value={user.password}
          onChange={handleUser}
          type="password"
          name="password"
          className="form-control"
          placeholder="Password"
        />
      </div>
      <button type="submit" className="btn btn-light mt-3">Iniciar Sesión</button>
    </form>
  );
};

export default Login;

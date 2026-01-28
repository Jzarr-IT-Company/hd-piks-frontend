import React, { useState } from 'react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { useGlobalState } from '../../Context/Context';

function RegisteredBttn() {
    const { username, setUsername,
        semail, setsEmail,
        password, setPassword,
        setConfirmPassword, } = useGlobalState();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const handleBttn = async () => {
        if (!username || !semail || !password) {
            message.error('Please fill all required fields');
            return;
        }
        setLoading(true)
        try {
            
            const response = await api.post(API_ENDPOINTS.SIGNUP, {
                name: username, email: semail, password
            });
            console.log(response.data.token.token)
            console.log(response.data.id)
            if (response.status === 200) {
                message.success("Signup Successsfully")
                setLoading(false)
                const obj = { name: username, email: semail }
                Cookies.set("id", response.data.id, { expires: 365 * 20 });
                Cookies.set("token", response.data.token.token, { expires: 365 * 20 });
                localStorage.setItem('informationData', JSON.stringify(obj));
                navigate('/')
                window.location.reload()
            }
            setUsername('');
            setsEmail('');
            setConfirmPassword('');
            setPassword("");
        } catch (error) {
            const status = error?.response?.status;
            const msg = error?.response?.data?.message || 'Signup failed';
            if (status === 400) {
                message.error('Account already exists');
            } else {
                message.error(msg);
            }
        } finally {
            setLoading(false)
        }
    }
    return (
        <button className="btn w-100 py-2 text-white fw-semibold" onClick={handleBttn} style={{ backgroundColor: "#58207e" }} type="submit">
            {loading ? <Spin /> : "REGISTER"}
        </button>
    )
}

export default RegisteredBttn
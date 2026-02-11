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
        confirmPassword,
        setConfirmPassword, } = useGlobalState();
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // At least 8 chars, one uppercase, one lowercase, one number, one special char
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    const validateSignup = () => {
        const cleanUsername = (username || '').trim();
        const cleanEmail = (semail || '').trim();

        if (!cleanUsername || !cleanEmail || !password || !confirmPassword) {
            message.error('Please fill all required fields');
            return false;
        }

        if (cleanUsername.length < 3) {
            message.error('Username must be at least 3 characters');
            return false;
        }

        if (!emailRegex.test(cleanEmail)) {
            message.error('Please enter a valid email address');
            return false;
        }

        if (!strongPasswordRegex.test(password)) {
            message.error(
                'Password must be 8+ chars with uppercase, lowercase, number and special character'
            );
            return false;
        }

        if (password !== confirmPassword) {
            message.error('Password and Confirm Password do not match');
            return false;
        }

        return true;
    };

    const handleBttn = async () => {
        if (!validateSignup()) {
            return;
        }
        setLoading(true)
        try {
            const cleanUsername = username.trim();
            const cleanEmail = semail.trim();
            const response = await api.post(API_ENDPOINTS.SIGNUP, {
                name: cleanUsername, email: cleanEmail, password
            });
            console.log(response.data.token.token)
            console.log(response.data.id)
            if (response.status === 200) {
                message.success("Signup Successsfully")
                setLoading(false)
                const obj = { name: cleanUsername, email: cleanEmail }
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

// src/pages/Login/Register.tsx - Register

import React, { useRef, useState, useEffect } from "react";
import { createUser, getUserByName } from '@/services/userService';
import { CreateUserData } from '@/interfaces/User/CreateUserData';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Register: React.FC = () => {
    const userNameRef = useRef<HTMLInputElement | null>(null);
    const userPasswordRef = useRef<HTMLInputElement | null>(null);
    const userPasswordAgainRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);

    // Use the useNavigate hook to handle page navigation
    const navigate = useNavigate();    

    // State to track password values and their validity
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [passwordValid, setPasswordValid] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });

    // Effect to validate password on change
    useEffect(() => {
        const length = password.length >= 8;
        const uppercase = /[A-Z]/.test(password);
        const lowercase = /[a-z]/.test(password);
        const number = /\d/.test(password);
        setPasswordValid({ length, uppercase, lowercase, number });
    }, [password]);

    const registerHandler = async () => {
        try {
            // Validation function: allows only Chinese characters, English letters, and numbers
            const validateInput = (input: string | null, fieldName: string) => {
                if (fieldName === "帳號") {
                    // Check if input is null or contains invalid characters
                    if (input === null || !/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(input)) {
                        toast.error(
                            <div>
                                {fieldName}只能包含中英文、數字，且不能為空
                            </div>,
                        );
                        throw new Error(`${fieldName}只能包含中英文、數字，且不能為空`);
                    }
                } else if (fieldName === "密碼") {
                    // Check if password meets requirements
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                    if (input === null || !passwordRegex.test(input)) {
                        toast.error(
                            <div>
                                {fieldName}必須包含大小寫英文、數字，且長度至少為8個字元
                            </div>,
                        );
                        throw new Error(`${fieldName}必須包含大小寫英文、數字，且長度至少為8個字元`);
                    }
                } else if (fieldName === "email") {
                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (input === null || input === "" || !emailRegex.test(input)) {
                        toast.error(
                            <div>
                                {fieldName}格式不正確
                            </div>,
                        );
                        throw new Error(`${fieldName}格式不正確`);
                    }
                }
            };

            // Get input values from refs
            const userName = userNameRef.current?.value || null;
            const userPassword = password || null;
            const userPasswordConfirm = passwordAgain || null;
            const email = emailRef.current?.value || null;

            // Validate each input
            validateInput(userName, "帳號");
            validateInput(userPassword, "密碼");
            validateInput(userPasswordConfirm, "密碼");
            validateInput(email, "email");

            // Avoid Duplicated userName
            const users = await getUserByName(userName);
            if(users.length !== 0){
                toast.error(`此用戶已存在`);
                throw new Error(`此用戶已存在`);
            }

            // Avoid inconsistent password
            if(userPassword !== userPasswordConfirm){
                toast.error(`請確保兩次輸入的密碼相同。`);
                throw new Error(`請確保兩次輸入的密碼相同。`);
            }
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userPassword!, salt);

            // If all validation passes, create new user
            const newuser: CreateUserData = {
                userName: userName,
                userPassword: hashedPassword,
                email: email,
            };

            try {
                await createUser(newuser);
                toast.success('註冊成功！');
                navigate('../../auth/login')
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(`註冊失敗: ${error.message}`);
                } else {
                    toast.error('註冊失敗: 未知錯誤');
                }
            }

        } catch (error) {
            // Catch errors and output the error message
            if (error instanceof Error) {
                console.error("註冊失敗", error.message);
                toast.error(
                    <div>
                        註冊失敗。{error.message}
                    </div>,
                );
            } else {
                console.error("發生未知錯誤");
                toast.error(
                    <div>
                        發生未知錯誤。
                    </div>,
                );
            }
        }
    };

    // Function to render password validation icon and text
    const renderValidation = (isValid: boolean, text: string) => {
        return (
            <div className="flex items-center mb-1">
                {isValid ? (
                    <FaCheckCircle className="text-green-500 mr-2" />
                ) : (
                    <FaTimesCircle className="text-red-500 mr-2" />
                )}
                <span className={isValid ? "text-green-500" : "text-red-500"}>
                    {text}
                </span>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#F7F1F0] to-[#C3A6A0]">
            <div className="w-[20rem] bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-center text-[#262220] mb-6">
                    註冊
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        registerHandler();
                    }}
                >
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="userName"
                        >
                            帳號
                        </label>
                        <input
                            ref={userNameRef}
                            id="userName"
                            className="w-full px-4 py-2 border border-[#C3A6A0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                            placeholder="輸入您的帳號"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="password"
                        >
                            密碼
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            className="w-full px-4 py-2 border border-[#C3A6A0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                            placeholder="輸入您的密碼"
                            required
                        />
                        {/* Password Validation Indicators */}
                        <div className="mt-2">
                            {renderValidation(passwordValid.length, "至少8個字元")}
                            {renderValidation(passwordValid.uppercase, "至少一個大寫字母")}
                            {renderValidation(passwordValid.lowercase, "至少一個小寫字母")}
                            {renderValidation(passwordValid.number, "至少一個數字")}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="repassword"
                        >
                            再次輸入密碼
                        </label>
                        <input
                            type="password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                            id="repassword"
                            className="w-full px-4 py-2 border border-[#C3A6A0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                            placeholder="再次輸入您的密碼"
                            required
                        />
                        
                        {passwordAgain && (
                            <div className="flex items-center mt-1">
                                {password === passwordAgain ? (
                                    <FaCheckCircle className="text-green-500 mr-2" />
                                ) : (
                                    <FaTimesCircle className="text-red-500 mr-2" />
                                )}
                                <span className={password === passwordAgain ? "text-green-500" : "text-red-500"}>
                                    {password === passwordAgain ? "密碼一致" : "密碼不一致"}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-[#262220] mb-1"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            ref={emailRef}
                            id="email"
                            className="w-full px-4 py-2 border border-[#C3A6A0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                            placeholder="輸入您的 Email"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#A15C38] hover:bg-[#262220] text-white font-medium py-2 text-sm rounded-lg transition-colors"
                    >
                        註冊
                    </button>
                </form>

                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => navigate("../../auth/login")}
                        className="text-sm text-[#A15C38] hover:text-[#262220] font-medium transition-colors"
                    >
                        回登入畫面
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;

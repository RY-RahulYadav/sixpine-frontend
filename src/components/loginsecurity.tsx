import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/loginsecurity.module.css';
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const LoginSecurity = () => {
    const { state } = useApp();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password] = useState('********');

    const [editingField, setEditingField] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Password change form
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getProfile();
            const profile = response.data.user || response.data;
            
            const userFromStorage = state.user || (() => {
                try {
                    const stored = localStorage.getItem('user');
                    return stored ? JSON.parse(stored) : null;
                } catch {
                    return null;
                }
            })();
            
            const mergedProfile = {
                ...userFromStorage,
                ...profile,
                first_name: profile?.first_name || userFromStorage?.first_name || '',
                last_name: profile?.last_name || userFromStorage?.last_name || '',
                email: profile?.email || userFromStorage?.email || '',
                mobile: profile?.mobile || profile?.phone || userFromStorage?.mobile || userFromStorage?.phone || '',
            };
            
            setFirstName(mergedProfile.first_name || '');
            setLastName(mergedProfile.last_name || '');
            setEmail(mergedProfile.email || '');
            setMobile(mergedProfile.mobile || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (field: string, currentValue: string) => {
        if (field === 'password') {
            setShowPasswordForm(true);
        } else {
        setEditingField(field);
        setInputValue(currentValue);
        }
    };

    const handleSave = async (field: string) => {
        try {
            if (field === 'name') {
                // Split name into first and last name
                const nameParts = inputValue.trim().split(' ');
                const first = nameParts[0] || '';
                const last = nameParts.slice(1).join(' ') || '';
                
                await authAPI.updateProfile({
                    first_name: first,
                    last_name: last
                });
                setFirstName(first);
                setLastName(last);
            } else if (field === 'email') {
                await authAPI.updateProfile({ email: inputValue });
                setEmail(inputValue);
            } else if (field === 'mobile') {
                await authAPI.updateProfile({ mobile: inputValue });
                setMobile(inputValue);
            }
            
            await fetchUserProfile();
            alert('Profile updated successfully');
        setEditingField(null);
        setInputValue('');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error updating profile';
            alert(errorMsg);
            console.error('Update profile error:', error);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.new_password !== passwordForm.new_password_confirm) {
            alert('New passwords do not match');
            return;
        }
        if (passwordForm.new_password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        try {
            await authAPI.changePassword(passwordForm);
            setShowPasswordForm(false);
            setPasswordForm({ old_password: '', new_password: '', new_password_confirm: '' });
            alert('Password changed successfully');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data?.old_password?.[0] || 'Error changing password';
            alert(errorMsg);
            console.error('Change password error:', error);
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        setInputValue('');
        setShowPasswordForm(false);
        setPasswordForm({ old_password: '', new_password: '', new_password_confirm: '' });
    };

    const displayName = firstName && lastName 
        ? `${firstName} ${lastName}`
        : firstName || lastName || 'User';

    const renderField = (field: string, label: string, value: string, description: string | null = null) => {
        if (field === 'password') return null; // Password is handled separately
        return (
        <div className={styles.securityItem}>
            <div className={styles.securityInfo}>
                <span className={styles.label}>{label}</span>
                {editingField === field ? (
                    <input
                            type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={styles.editInput}
                    />
                ) : (
                    <span className={styles.value}>{value}</span>
                )}
                {description && <p className={styles.description}>{description}</p>}
            </div>
            <div className={styles.securityActions}>
                {editingField === field ? (
                    <>
                        <button className={styles.saveButton} onClick={() => handleSave(field)}>Save</button>
                        <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <button className={styles.editButton} onClick={() => handleEditClick(field, value)}>EDIT</button>
                )}
            </div>
        </div>
    );
    };

    if (loading) {
        return (
            <div className={styles.logincontainer}>
                <div className={styles.header}>
                    <Link to="/your-account">Your Account</Link> / <span>Login & Security</span>
                </div>
                <h2 className={styles.sectionTitle}>Login & Security</h2>
                <div className={styles.main}>
                    <div className={styles.securitySection}>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.logincontainer}>
            <div className={styles.header}>
                <Link to="/your-account">Your Account</Link> / <span>Login & Security</span>
            </div>
            
            <h2 className={styles.sectionTitle}>Login & Security</h2>
            <div className={styles.main}>
            <div className={styles.securitySection}>
                    {renderField('name', 'Name', displayName)}
                {renderField('email', 'Email', email)}
                {renderField(
                    'mobile',
                    'Primary mobile number',
                        mobile || 'Not set',
                    'Quickly sign in, easily recover passwords and receive security notifications with this number.'
                )}
                    
                    {/* Password Field */}
                    <div className={styles.securityItem}>
                        <div className={styles.securityInfo}>
                            <span className={styles.label}>Password</span>
                            {showPasswordForm ? (
                                <div style={{ marginTop: '12px' }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Old Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.old_password}
                                            onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.new_password_confirm}
                                            onChange={(e) => setPasswordForm({...passwordForm, new_password_confirm: e.target.value})}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #d5d9d9', borderRadius: '4px' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className={styles.value}>{password}</span>
                            )}
                        </div>
                        <div className={styles.securityActions}>
                            {showPasswordForm ? (
                                <>
                                    <button className={styles.saveButton} onClick={handleChangePassword}>Save</button>
                                    <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                                </>
                            ) : (
                                <button className={styles.editButton} onClick={() => handleEditClick('password', password)}>EDIT</button>
                            )}
                        </div>
                    </div>

                <div className={`${styles.securityItem} ${styles.compromisedAccount}`}>
                    <div className={styles.securityInfo}>
                        <span className={styles.label}>Compromised Account</span>
                        <p className={styles.description}>Take steps like changing your password and signing out everywhere.</p>
                    </div>
                    <div className={styles.securityActions}>
                        <button className={styles.manageButton}>Manage</button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LoginSecurity;
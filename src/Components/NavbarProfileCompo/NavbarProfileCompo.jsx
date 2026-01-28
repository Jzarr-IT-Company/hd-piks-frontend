import React from 'react'
import { useGlobalState } from '../../Context/Context'
import Cookies from 'js-cookie';
import bydefault from '../../assets/user2.png';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { User, Settings, CreditCard, LayoutDashboard, LogOut } from 'lucide-react';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

function NavbarProfileCompo() {
    const { userData, creatorData } = useGlobalState();
    const id = Cookies.get('id')
    const token = Cookies.get('token');
    const navigate = useNavigate();
    const isCreator = userData?.role === 'creator' || creatorData?.status === 'approved';

    const settings = [
        { name: 'Profile', link: '/profile', Icon: User },
        { name: 'Account', link: '/account', Icon: Settings },
        { name: 'Upgrade Plan', link: '/pricing', Icon: CreditCard },
        ...(isCreator ? [{ name: 'Dashboard', link: '/dashboard', Icon: LayoutDashboard }] : []),
        { name: 'Logout', link: '/', Icon: LogOut, action: 'logout' }
    ];
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = async () => {
        try {
            await api.post(API_ENDPOINTS.LOGOUT, { id });
        } catch (err) {
            console.error('Logout failed, clearing session locally', err);
        } finally {
            Cookies.remove('id');
            Cookies.remove('token');
            handleCloseUserMenu();
            navigate('/');
            window.location.reload();
        }
    };
    return (
        <>
            {
                id && token ?
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                {
                                    userData?.profileImage ?
                                        <Avatar alt="Remy Sharp" src={userData.profileImage && userData.profileImage} />
                                        : <Avatar alt="Remy Sharp" src={bydefault} />
                                }
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px', width: '300px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <Box sx={{ width: '200px' }}>
                                {settings.map(({ name, link, Icon, action }) => (
                                    <MenuItem
                                        key={name}
                                        component={action === 'logout' ? 'button' : Link}
                                        to={action === 'logout' ? undefined : link}
                                        onClick={action === 'logout' ? handleLogout : handleCloseUserMenu}
                                        sx={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            {Icon ? <Icon size={18} strokeWidth={1.6} /> : null}
                                            <Typography sx={{ textAlign: 'center', width: '100%' }}>
                                                {name}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Box>
                        </Menu>
                    </Box> : <Link className='btn border text-white' to={'/login'}>Signup</Link>
            }
        </>
    )
}

export default NavbarProfileCompo
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import PopupState, { bindToggle, bindPopper } from 'material-ui-popup-state';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import { FaFacebook, FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa'; 

function ShareButtonSm({ data }) {
    React.useEffect(() => {
        console.log(data.imageUrlSep);
    }, []);

    return (
        <PopupState variant="popper" popupId="social-media-popup">
            {(popupState) => (
                <div>
                    <Button 
                        variant="contained" 
                        style={{ fontSize: "11px",backgroundColor:"white",color:"black",boxShadow:"none",outline:"none"}} 
                        className='py-3  border' 
                        {...bindToggle(popupState)}
                    >
                        <i className="fa-solid fa-share-nodes me-2"></i> Share
                    </Button>
                    <Popper
                        {...bindPopper(popupState)}
                        transition
                        disablePortal
                        placement="bottom"
                    >
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={240}>
                                <Paper sx={{ p: 2, width: 200 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Share this on:
                                    </Typography>
                                    <div className="d-flex" style={{ flexWrap: 'wrap' }}>
                                        <Button
                                            startIcon={<FaFacebook size={35} style={{ color: '#1877F2' }} />}
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${data.imageUrlSep}`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1, maxWidth: '48%' }}
                                        >
                                        </Button>
                                        <Button
                                            startIcon={<FaWhatsapp size={36} style={{ color: '#25D366' }} />}
                                            href={`https://api.whatsapp.com/send?text=${data.imageUrlSep}`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1, maxWidth: '48%' }}
                                        >
                                        </Button>
                                        <Button
                                            startIcon={<FaInstagram size={36} style={{ color: '#E4405F' }} />}
                                            href={`https://www.instagram.com/sharer.php?u=${data.imageUrlSep}`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1, maxWidth: '48%' }}
                                        >
                                        </Button>
                                        <Button
                                            startIcon={<FaTiktok size={36} style={{ color: '#000000' }} />}
                                            href={`https://www.tiktok.com/share?url=${data.imageUrlSep}`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1, maxWidth: '48%' }}
                                        >
                                        </Button>
                                    </div>
                                </Paper>
                            </Fade>
                        )}
                    </Popper>
                </div>
            )}
        </PopupState>
    );
}

export default ShareButtonSm;

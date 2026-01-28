import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import PopupState, { bindToggle, bindPopper } from 'material-ui-popup-state';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import { FaFacebook, FaWhatsapp, FaInstagram, FaTiktok, FaPinterest } from 'react-icons/fa';


function ShareButton({ data, id, userdata }) {
    React.useEffect(() => {
        console.log(data[0]?.imageUrl
        )
    }, [])
    return (
        <PopupState variant="popper" popupId="social-media-popup">
            {(popupState) => (
                <div >
                    <Button variant="contained" className='py-3 px-3 d-none d-md-block' style={{fontSize:"16px"}} {...bindToggle(popupState)}>
                        <i className="fa-solid fa-share-nodes"></i> Share
                    </Button>
                    <Button variant="contained" className=' d-block d-md-none'style={{fontSize:"17px"}} {...bindToggle(popupState)}>
                        <i className="fa-solid fa-share-nodes"></i>
                    </Button>
                    <Popper
                        {...bindPopper(popupState)}
                        transition
                        disablePortal
                        placement="bottom"
                    >
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={240}>
                                <Paper sx={{ p: 2, width: 400 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Share this on:
                                    </Typography>
                                    <div className="d-flex">
                                        <Button
                                            startIcon={<FaFacebook size={35} style={{ color: '#1877F2' }} />}
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${data[0].imageUrl}`} target="_blank"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                        >
                                        </Button>
                                        <Button
                                            startIcon={<FaWhatsapp size={36} style={{ color: '#25D366' }} />}
                                            href={`https://api.whatsapp.com/send?text=https://www.hdpiks.com/detial/images/${id[0]._id}/${userdata._id}`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                        >
                                        </Button>
                                        <Button
                                            startIcon={<FaInstagram size={36} style={{ color: '#E4405F' }} />}
                                            href={`https://www.instagram.com/sharer.php?u=${data[0].imageUrl}`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                        >
                                        </Button>
                                        <Button
                                            startIcon={<FaTiktok size={36} style={{ color: '#000000' }} />}
                                            href={`https://www.tiktok.com/share?url=${data[0].imageUrl}`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                        >
                                        </Button>
                                        <Button
                                            startIcon={<FaPinterest size={36} style={{ color: '#E60023' }} />}
                                            href={`https://pinterest.com/pin/create/button/?url=${data[0].imageUrl}&media=${data[0].imageUrl}&description=Check this out!`}
                                            target="_blank"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                        ></Button>
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

export default ShareButton
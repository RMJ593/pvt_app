import React from 'react';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import './TopBar.css';

function TopBar({ settings }) {
    return (
        <div className="top-bar">
            <div className="top-bar-container">
                <div className="top-bar-left">
                    <div className="top-bar-item">
                        <MapPin size={16} className="top-bar-icon" />
                        <span>{settings?.contact_address || '169 West Rd, Newcastle upon Tyne NE15 6PQ'}</span>
                    </div>
                    
                    <div className="top-bar-divider"></div>
                    
                    <div className="top-bar-item">
                        <Clock size={16} className="top-bar-icon" />
                        <span>Daily : 05:00PM to 10:00PM</span>
                    </div>
                </div>

                <div className="top-bar-right">
                    <div className="top-bar-item">
                        <Phone size={16} className="top-bar-icon" />
                        <span>{settings?.contact_phone || '+44 7878277198'}</span>
                    </div>
                    
                    <div className="top-bar-divider"></div>
                    
                    <div className="top-bar-item">
                        <Mail size={16} className="top-bar-icon" />
                        <span>{settings?.contact_email || 'info@curryleaf.uk'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
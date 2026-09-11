function referral = generateReferral(severity,~,quality)
%GENERATEREFERRAL Prototype triage/referral logic.
    if quality.score<60
        referral=struct('recommended',false,'priority','RECAPTURE', ...
            'reason','Image quality insufficient. Recapture required.'); return
    end
    level=severity.level;
    switch level
        case 0, rec=false; pri='ROUTINE'; reason='No referable diabetic retinopathy detected.';
        case 1, rec=false; pri='LOW'; reason='Mild NPDR detected. Routine monitoring recommended.';
        case 2, rec=true; pri='MEDIUM'; reason='Referable DR suspected based on detected retinal lesions.';
        case 3, rec=true; pri='HIGH'; reason='Severe NPDR detected. Ophthalmologist review recommended.';
        otherwise, rec=true; pri='URGENT'; reason='Proliferative DR detected. Immediate ophthalmologist referral required.';
    end
    referral=struct('recommended',rec,'priority',pri,'reason',reason);
end

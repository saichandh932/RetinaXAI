function severity = gradeDiabeticRetinopathy(lesions,~)
%GRADEDIABETICRETINOPATHY Prototype 5-level grading logic.
% For clinical deployment, replace with a validated trained classifier.
    MA=lesions.microaneurysms; EX=lesions.exudates; HE=lesions.hemorrhages; NV=lesions.neovascularization;
    if NV.detected
        level=4; label='Proliferative DR'; detail='Proliferative Diabetic Retinopathy';
    elseif HE.count>=15 || (MA.count>=30 && EX.detected)
        level=3; label='Severe NPDR'; detail='Severe Non-Proliferative Diabetic Retinopathy';
    elseif HE.count>0 || EX.detected || MA.count>=10
        level=2; label='Moderate NPDR'; detail='Moderate Non-Proliferative Diabetic Retinopathy';
    elseif MA.detected
        level=1; label='Mild NPDR'; detail='Mild Non-Proliferative Diabetic Retinopathy';
    else
        level=0; label='No DR'; detail='No diabetic retinopathy detected';
    end
    confidence=0.70;
    if level>=1 && MA.detected, confidence=confidence+0.06; end
    if level>=2 && EX.detected, confidence=confidence+0.07; end
    if level>=2 && HE.detected, confidence=confidence+0.07; end
    if level==4 && NV.detected, confidence=confidence+0.08; end
    severity=struct('level',level,'label',label,'detail',detail,'confidence',min(0.98,confidence));
end

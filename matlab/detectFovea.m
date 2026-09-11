function fovea = detectFovea(I,opticDisc)
%DETECTFOVEA Anatomical baseline estimate relative to optic disc.
    [H,W,~] = size(I);
    if ~opticDisc.detected
        fovea = struct('detected',false,'x',NaN,'y',NaN); return
    end
    odX = opticDisc.x*W; odY = opticDisc.y*H;
    foveaX = max(1,min(W,odX - 0.35*W));
    foveaY = max(1,min(H,odY));
    fovea = struct('detected',true,'x',foveaX/W,'y',foveaY/H);
end

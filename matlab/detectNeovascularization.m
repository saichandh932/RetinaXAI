function result = detectNeovascularization(I,vesselMask,opticDisc)
%DETECTNEOVASCULARIZATION Baseline peripapillary vascular-density heuristic.
    if ~opticDisc.detected
        result=struct('detected',false,'confidence',0.1,'vascularDensity',0,'mask',false(size(vesselMask))); return
    end
    [H,W]=size(vesselMask); [X,Y]=meshgrid(1:W,1:H);
    odX=opticDisc.x*W; odY=opticDisc.y*H; radius=0.18*min(H,W);
    discRegion=(X-odX).^2+(Y-odY).^2<radius^2;
    localVessels=vesselMask & discRegion;
    density=nnz(localVessels)/max(1,nnz(discRegion));
    detected=density>0.18;
    result=struct('detected',detected,'confidence',min(0.95,0.4+density), ...
        'vascularDensity',density,'mask',localVessels);
end

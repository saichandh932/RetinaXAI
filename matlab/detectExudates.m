function result = detectExudates(I)
%DETECTEXUDATES Baseline bright yellow/white lesion detector.
    R=I(:,:,1); G=I(:,:,2); B=I(:,:,3);
    brightness=(R+G)/2; yellowIndex=(R+G)/2-B;
    mask=brightness>0.65 & yellowIndex>0.15;
    mask=imopen(mask,strel('disk',2)); mask=imclose(mask,strel('disk',3));
    mask=bwareaopen(mask,20);
    retinalArea=nnz(createCircularMask(size(R))); area=nnz(mask);
    pct=100*area/max(1,retinalArea);
    if pct==0, severity='none'; elseif pct<1, severity='mild'; elseif pct<3, severity='moderate'; else, severity='extensive'; end
    result=struct('detected',area>0,'area',severity,'areaPercentage',pct, ...
        'confidence',min(0.98,0.50+pct/10),'mask',mask);
end

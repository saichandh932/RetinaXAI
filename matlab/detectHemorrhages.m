function result = detectHemorrhages(I)
%DETECTHEMORRHAGES Baseline dark-red lesion detector.
    R=I(:,:,1); G=I(:,:,2);
    darkRed=(R-G)>0.08 & R<0.55;
    mask=imopen(darkRed,strel('disk',2)); mask=imclose(mask,strel('disk',3));
    mask=bwareaopen(mask,30);
    stats=regionprops(mask,'Area','PixelIdxList');
    valid=[stats.Area] >= 30;
    count=nnz(valid);
    result=struct('detected',count>0,'count',count, ...
        'confidence',min(0.95,0.55+count/50),'mask',mask);
end

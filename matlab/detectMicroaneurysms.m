function result = detectMicroaneurysms(I)
%DETECTMICROANEURYSMS Baseline small-dark-lesion detector.
    G = I(:,:,2);
    darkObjects = imbothat(adapthisteq(G),strel('disk',2));
    level = graythresh(darkObjects);
    mask = bwareaopen(darkObjects > level*0.7,3);
    stats = regionprops(mask,'Area','Centroid','PixelIdxList');
    finalMask = false(size(mask)); count = 0;
    for k = 1:numel(stats)
        if stats(k).Area >= 3 && stats(k).Area <= 100
            finalMask(stats(k).PixelIdxList) = true;
            count = count + 1;
        end
    end
    result = struct('detected',count>0,'count',count, ...
        'confidence',min(0.99,0.50+count/100),'mask',finalMask);
end

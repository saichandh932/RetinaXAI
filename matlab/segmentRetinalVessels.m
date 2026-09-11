function vesselMask = segmentRetinalVessels(I)
%SEGMENTRETINALVESSELS Baseline vessel segmentation using green-channel morphology.
    G = I(:,:,2);
    enhanced = adapthisteq(G);
    blackHat = imbothat(enhanced,strel('disk',5));
    level = graythresh(blackHat);
    vesselMask = imbinarize(blackHat,level*0.8);
    vesselMask = bwareaopen(vesselMask,20);
    vesselMask = imclose(vesselMask,strel('disk',1));
    vesselMask = vesselMask & createCircularMask(size(G));
end

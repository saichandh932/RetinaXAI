function opticDisc = detectOpticDisc(I)
%DETECTOPTICDISC Baseline bright-region optic-disc candidate detector.
    gray = rgb2gray(I);
    bright = gray > 0.85;
    bright = bwareaopen(bright,100);
    stats = regionprops(bright,'Area','Centroid','MeanIntensity');
    if isempty(stats)
        opticDisc = struct('detected',false,'x',NaN,'y',NaN,'area',0); return
    end
    scores = [stats.Area] .* [stats.MeanIntensity];
    [~,idx] = max(scores);
    c = stats(idx).Centroid;
    opticDisc = struct('detected',true,'x',c(1)/size(gray,2), ...
        'y',c(2)/size(gray,1),'area',stats(idx).Area);
end

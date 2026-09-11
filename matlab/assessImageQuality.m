function quality = assessImageQuality(I)
%ASSESSIMAGEQUALITY Estimate focus, illumination, FOV, contrast and artifacts.
    I = im2double(I);
    gray = rgb2gray(I);
    mask = createCircularMask(size(gray));

    lap = imfilter(gray, fspecial('laplacian', 0.2), 'replicate');
    lapVariance = var(lap(mask));
    focusScore = clamp(100 * lapVariance / 0.02, 0, 100);

    roi = gray(mask);
    meanIntensity = mean(roi);
    illuminationScore = clamp(100 - abs(meanIntensity - 0.45) * 200, 0, 100);

    contrastValue = std(roi);
    contrastScore = clamp(contrastValue * 350, 0, 100);

    coverage = nnz(mask) / numel(mask);
    fovScore = clamp(coverage * 120, 0, 100);

    glare = gray > 0.97;
    artifactRatio = nnz(glare & mask) / max(1,nnz(mask));
    artifactScore = clamp(100 - artifactRatio * 1000, 0, 100);

    score = mean([focusScore illuminationScore fovScore contrastScore artifactScore]);
    if score >= 80, status = 'GOOD'; elseif score >= 60, status = 'ACCEPTABLE'; else, status = 'UNGRADABLE'; end

    quality = struct('score',round(score), 'status',status, ...
        'focus',indicator(focusScore), 'illumination',indicator(illuminationScore), ...
        'fov',indicator(fovScore), 'contrast',indicator(contrastScore), ...
        'artifacts',artifactIndicator(artifactScore));
end

function s = indicator(v)
    if v >= 80, st = 'good'; elseif v >= 60, st = 'acceptable'; else, st = 'poor'; end
    s = struct('score',round(v),'status',st);
end
function s = artifactIndicator(v)
    if v >= 80, st = 'low'; elseif v >= 60, st = 'moderate'; else, st = 'high'; end
    s = struct('score',round(v),'status',st);
end
function y = clamp(x,a,b), y = min(max(x,a),b); end

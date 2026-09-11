function result = runDRScreening(imageInput)
%RUNDRSCREENING End-to-end prototype diabetic-retinopathy screening pipeline.
%   result = runDRScreening(imageInput)
%   imageInput may be an image path, URL-free local file path, or image matrix.
%
% NOTE: This is a research/SIH prototype. The fallback lesion detectors are
% image-processing heuristics, not a clinically validated diagnostic system.

    tStart = tic;
    I = loadRetinalImage(imageInput);

    quality = assessImageQuality(I);
    result = struct();
    result.quality = quality;
    result.processingTime = [];

    if quality.score < 60
        result.severity = [];
        result.confidence = 0;
        result.lesions = [];
        result.referral = generateReferral([], [], quality);
        result.processingTime = toc(tStart);
        return;
    end

    enhanced = preprocessRetinalImage(I);
    vesselMask = segmentRetinalVessels(enhanced);
    opticDisc = detectOpticDisc(enhanced);
    fovea = detectFovea(enhanced, opticDisc);

    microaneurysms = detectMicroaneurysms(enhanced);
    exudates = detectExudates(enhanced);
    hemorrhages = detectHemorrhages(enhanced);
    neovascularization = detectNeovascularization(enhanced, vesselMask, opticDisc);

    lesions = struct( ...
        'microaneurysms', microaneurysms, ...
        'exudates', exudates, ...
        'hemorrhages', hemorrhages, ...
        'neovascularization', neovascularization, ...
        'vessels', struct('detected', nnz(vesselMask) > 0), ...
        'opticDisc', opticDisc, ...
        'fovea', fovea);

    severity = gradeDiabeticRetinopathy(lesions, enhanced);
    referral = generateReferral(severity, lesions, quality);
    gradcam = generateGradCAM(enhanced);

    result.severity = severity;
    result.confidence = severity.confidence;
    result.lesions = lesions;
    result.referral = referral;
    result.gradcam = gradcam;
    result.enhancedImage = enhanced;
    result.vesselMask = vesselMask;
    result.opticDisc = opticDisc;
    result.fovea = fovea;
    result.processingTime = toc(tStart);
end

function I = loadRetinalImage(imageInput)
    if ischar(imageInput) || isstring(imageInput)
        if ~isfile(imageInput), error('Image file does not exist: %s', imageInput); end
        I = imread(imageInput);
    elseif isnumeric(imageInput)
        I = imageInput;
    else
        error('imageInput must be a local image path or numeric image matrix.');
    end
    if ndims(I) == 2, I = repmat(I, [1 1 3]); end
    if size(I,3) > 3, I = I(:,:,1:3); end
    I = im2double(I);
end

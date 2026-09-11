function enhanced = preprocessRetinalImage(I)
%PREPROCESSRETINALIMAGE Resize, illumination-correct and contrast-enhance fundus image.
    I = im2double(I);
    I = imresize(I,[512 512]);
    G = I(:,:,2);
    G = adapthisteq(G,'ClipLimit',0.01,'NumTiles',[8 8]);
    background = imgaussfilt(G,25);
    corrected = mat2gray(G - background);
    corrected = medfilt2(corrected,[3 3]);
    enhanced = repmat(corrected,[1 1 3]);
end

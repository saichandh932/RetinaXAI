function cam = generateGradCAM(I)
%GENERATEGRADCAM Use a trained network if DRModel.mat exists; otherwise return []
% so the pipeline remains executable without a model file.
    cam=[];
    modelFile=fullfile(fileparts(mfilename('fullpath')),'models','DRModel.mat');
    if ~isfile(modelFile), return; end
    data=load(modelFile);
    if ~isfield(data,'net'), return; end
    net=data.net;
    try
        inputSize=net.Layers(1).InputSize;
        inputImage=imresize(I,inputSize(1:2));
        scoreMap=gradCAM(net,inputImage);
        cam=imresize(mat2gray(scoreMap),[size(I,1),size(I,2)]);
    catch ME
        warning('Grad-CAM unavailable: %s',ME.message);
    end
end

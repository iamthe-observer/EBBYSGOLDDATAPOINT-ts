import { defineStore } from 'pinia';
import { supabase } from '../supabase/supabase';
import { ref, computed } from 'vue';

export const useApplyImgStore = defineStore('aplImgUpload', () => {
    const files = ref([]);
    const uploading = ref(false);
    const primePath = ref(null);
    const secPath = ref(null);
    const wardsPath = ref([]);

    function setFiles(file, type) {
        // type -> the kind of apl being saved
        file.apl_type = type;
        const updatedFiles = files.value.filter(x => x.apl_type !== file.apl_type);
        updatedFiles.push(file);
        files.value = updatedFiles;
    }

    function removeFile() {
        if (hasFiles.value) {
            const updatedFiles = files.value.filter(x => x.apl_type !== 'sec');
            files.value = updatedFiles;
        }
    }

    const hasFiles = computed(() => {
        if (files.value.length != 0) return true;
        return false;
    });

    async function uploadFiles(uuid) {
        let paths = [];
        for (const file of files.value) {
            paths.push(await uploadAplImg(uuid, file));
        }
        console.log(paths);

        primePath.value = paths.filter(path => {
            if (path.includes('prime')) {
                return path;
            }
        });
        secPath.value = paths.filter(path => {
            if (path.includes('sec')) {
                return path;
            }
        });
        wardsPath.value = paths.filter(path => {
            if (path.includes('ward')) {
                return path;
            }
        });
        return {
            primePath: primePath.value,
            secPath: secPath.value,
            wardsPath: wardsPath.value,
        };
    }

    async function updateFile(path) {
        let paths = [];
        for (const file of files.value) {
            paths.push(await updateSingleAplImg(path));
        }

        primePath.value = paths.filter(path => {
            if (path.includes('prime')) {
                return path;
            } else {
                return 'avatar.svg';
            }
        });
        secPath.value = paths.filter(path => {
            if (path.includes('sec')) {
                return path;
            } else {
                return 'avatar.svg';
            }
        });
        wardsPath.value = paths.filter(path => {
            if (path.includes('ward')) {
                return path;
            } else {
                return 'avatar.svg';
            }
        });

        return {
            primePath: primePath.value,
            secPath: secPath.value,
            wardsPath: wardsPath.value,
        };
    }

    const deleteAplImg = async path => {
        try {
            const { data, error } = await supabase.storage
                .from('applicants')
                .remove([path]);
            if (error) throw error;
            return data;
        } catch (err) {
            console.trace(err.message);
        }
    };

    async function uploadAplImg(uuid, file) {
        console.log(file);
        if (!hasFiles.value) {
            const path = `avatar.svg`;
            return path;
        } else {
            const fileExt = file.name.split('.').pop();
            const fileName = `${file.apl_type}`;
            const filePath = `${fileName}.${fileExt}`;
            const path = `public/${uuid}/${filePath}`;

            try {
                const { data, error } = await supabase.storage
                    .from('applicants')
                    .upload(path, file);
                if (error) throw error;

                return path;
            } catch (err) {
                alert(err.message);
            }
        }
    }

    async function updateSingleAplImg(path) {
        try {
            const { data, error } = await supabase.storage
                .from('applicants')
                .update(path, files.value[0], {
                    cacheControl: '1',
                    upsert: true,
                });

            if (error) throw error;
            return path;
        } catch (error) {
            console.log(error.message);
        }
    }

    const updateAplImg = async(path, uuid) => {
        try {
            await deleteAplImg(path);
            await uploadAplImg(uuid, files.value[0]);
        } catch (err) {
            console.trace(err.message);
        } finally {
            resetFiles();
        }
    };

    function resetFiles() {
        files.value = [];
    }

    return {
        files,
        hasFiles,
        uploading,
        uploadAplImg,
        deleteAplImg,
        updateAplImg,
        updateSingleAplImg,
        uploadFiles,
        updateFile,
        setFiles,
        removeFile,
        resetFiles,
        primePath,
        secPath,
        wardsPath,
    };
});
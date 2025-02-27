document.body.addEventListener('click', () => {
    if (!document.pointerLockElement) {
        canvas.requestPointerLock();
    }
});
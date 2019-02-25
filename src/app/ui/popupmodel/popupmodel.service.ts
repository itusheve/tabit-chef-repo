export class ModalService {
    private modals: any [] = [];

    add(model: any) {
        this.modals.push(model);
    }

    remove(id: string) {
        this.modals = this.modals.filter(x => x.id !== id);
    }

    open(id : string) {
        let modal: any = this.modals.filter(x => x.id === id)[0];
        modal.open();
    }

    close(id:string) {
        let modal: any = this.modals.filter(x => x.id === id)[0];
        modal.close();
    }
}

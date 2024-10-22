export async function load({ params }) {
    const { id } = params; // Extract the id directly from params
    // console.log(id);

    return { id };
}
